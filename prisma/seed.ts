import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Platform super admin -------------------------------------------------
  const superAdminPassword = await hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@churchflow.app" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@churchflow.app",
      passwordHash: superAdminPassword,
      role: "SUPER_ADMIN",
    },
  });

  // --- Demo church ----------------------------------------------------------
  const demoChurch = await prisma.church.upsert({
    where: { slug: "lighthouse" },
    update: {},
    create: {
      name: "Lighthouse Assembly",
      slug: "lighthouse",
      motto: "Raising Generations of Worshipers",
      address: "12 Independence Avenue, Accra",
      phone: "+233 20 000 0000",
      email: "info@lighthouse.church",
      plan: "BASIC",
      status: "ACTIVE",
    },
  });

  const churchId = demoChurch.id;

  const adminPassword = await hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lighthouse.church" },
    update: { churchId },
    create: {
      churchId,
      name: "Ama Serwaa",
      email: "admin@lighthouse.church",
      passwordHash: adminPassword,
      role: "CHURCH_ADMIN",
    },
  });

  // --- Departments ----------------------------------------------------------
  const departmentNames = [
    "Choir",
    "Ushers",
    "Youth Ministry",
    "Women's Ministry",
    "Men's Ministry",
    "Children's Ministry",
    "Evangelism",
  ];
  const departments: Record<string, string> = {};
  for (const name of departmentNames) {
    const dept = await prisma.department.create({
      data: { churchId, name, description: `${name} department` },
    });
    departments[name] = dept.id;
  }

  // --- Finance categories ---------------------------------------------------
  const incomeCategories = [
    "Tithes",
    "Offering",
    "First Fruits",
    "Thanksgiving",
    "Building Fund",
    "Welfare",
    "Donations",
  ];
  const expenseCategories = [
    "Utilities",
    "Salaries",
    "Events",
    "Outreach",
    "Maintenance",
  ];
  const categoryIds: Record<string, string> = {};
  for (const name of incomeCategories) {
    const c = await prisma.financeCategory.create({
      data: { churchId, name, type: "INCOME" },
    });
    categoryIds[name] = c.id;
  }
  for (const name of expenseCategories) {
    const c = await prisma.financeCategory.create({
      data: { churchId, name, type: "EXPENSE" },
    });
    categoryIds[name] = c.id;
  }

  // --- Members --------------------------------------------------------------
  const membersData = [
    ["Kwame", "Asante", "MALE", "0234500001"],
    ["Ama", "Serwaa", "FEMALE", "0234500002"],
    ["Kofi", "Mensah", "MALE", "0234500003"],
    ["Efua", "Owusu", "FEMALE", "0234500004"],
    ["Yaw", "Boateng", "MALE", "0234500005"],
    ["Akosua", "Adjei", "FEMALE", "0234500006"],
    ["Kojo", "Bediako", "MALE", "0234500007"],
    ["Abena", "Darko", "FEMALE", "0234500008"],
  ] as const;

  const memberIds: string[] = [];
  for (const [firstName, lastName, gender, memberId] of membersData) {
    const m = await prisma.member.create({
      data: {
        churchId,
        memberId,
        firstName,
        lastName,
        gender,
        maritalStatus: "SINGLE",
        dateJoined: new Date(),
        status: "ACTIVE",
      },
    });
    memberIds.push(m.id);
  }

  // Link a few members to departments
  const choirId = departments["Choir"];
  const youthId = departments["Youth Ministry"];
  await prisma.departmentMember.createMany({
    data: [
      { churchId, departmentId: choirId, memberId: memberIds[0], role: "MEMBER" },
      { churchId, departmentId: choirId, memberId: memberIds[3], role: "MEMBER" },
      { churchId, departmentId: youthId, memberId: memberIds[2], role: "LEADER" },
      { churchId, departmentId: youthId, memberId: memberIds[4], role: "MEMBER" },
    ],
  });

  // --- Sample transactions --------------------------------------------------
  await prisma.financeTransaction.createMany({
    data: [
      { churchId, categoryId: categoryIds["Tithes"], memberId: memberIds[0], amount: 250, type: "INCOME", method: "MOBILE_MONEY", date: new Date(), notes: "Tithe" },
      { churchId, categoryId: categoryIds["Offering"], memberId: memberIds[1], amount: 120, type: "INCOME", method: "CASH", date: new Date() },
      { churchId, categoryId: categoryIds["First Fruits"], memberId: memberIds[2], amount: 500, type: "INCOME", method: "BANK", date: new Date() },
      { churchId, categoryId: categoryIds["Thanksgiving"], memberId: memberIds[3], amount: 80, type: "INCOME", method: "MOBILE_MONEY", date: new Date() },
      { churchId, categoryId: categoryIds["Utilities"], amount: 450, type: "EXPENSE", method: "CASH", date: new Date(), notes: "ECG bill" },
    ],
  });

  // --- Attendance (today, Sunday service) -----------------------------------
  await prisma.attendance.createMany({
    data: memberIds.map((memberId) => ({
      churchId,
      memberId,
      type: "SUNDAY",
      method: "MANUAL",
      date: new Date(),
      recordedById: admin.id,
    })),
  });

  // --- Events ---------------------------------------------------------------
  await prisma.event.createMany({
    data: [
      { churchId, name: "Annual Harvest Thanksgiving", type: "CONVENTION", startDate: new Date(Date.now() + 21 * 86400000), endDate: new Date(Date.now() + 23 * 86400000), location: "Main Auditorium" },
      { churchId, name: "Youth Camp 2026", type: "CAMP", startDate: new Date(Date.now() + 45 * 86400000), endDate: new Date(Date.now() + 48 * 86400000), location: "Akyem Camp" },
      { churchId, name: "Palm Sunday Baptism", type: "BAPTISM", startDate: new Date(Date.now() + 14 * 86400000), location: "River Site" },
    ],
  });

  // --- Prayer requests ------------------------------------------------------
  await prisma.prayerRequest.createMany({
    data: [
      { churchId, memberId: memberIds[0], name: "Kwame Asante", request: "Prayer for a new job", status: "PENDING" },
      { churchId, memberId: memberIds[2], name: "Kofi Mensah", request: "Family healing", status: "IN_PROGRESS" },
      { churchId, name: "Visitor Mariam", request: "Prayer for exams", status: "PENDING" },
    ],
  });

  // --- Sermons --------------------------------------------------------------
  await prisma.sermon.createMany({
    data: [
      { churchId, title: "The Power of a Praying Church", topic: "Prayer", series: "Foundations", date: new Date(Date.now() - 7 * 86400000), preacherId: admin.id },
      { churchId, title: "Walking in God's Promises", topic: "Faith", series: "Promises", date: new Date(Date.now() - 14 * 86400000), preacherId: admin.id },
    ],
  });

  console.log("Seeded database:");
  console.log(`  - Super admin:  admin@churchflow.app  /  admin123`);
  console.log(`  - Church admin: admin@lighthouse.church / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
