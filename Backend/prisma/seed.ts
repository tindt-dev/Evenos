import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv('DATABASE_URL') }),
});

async function main() {
  const organizerId = 'usr_demo_organizer';
  const organizerEmail = 'organizer@evenos.dev';
  const organizerPassword = 'Evenos@123';

  const attendeeId = 'usr_demo_attendee';
  const attendeeEmail = 'attendee@evenos.dev';
  const attendeePassword = 'Evenos@123';

  const hashedOrganizer = await bcrypt.hash(organizerPassword, 10);
  const hashedAttendee = await bcrypt.hash(attendeePassword, 10);

  await prisma.user.upsert({
    where: { id: organizerId },
    update: {
      email: organizerEmail,
      password: hashedOrganizer,
      fullName: 'Evenos Organizer',
      role: Role.ORGANIZER,
    },
    create: {
      id: organizerId,
      email: organizerEmail,
      password: hashedOrganizer,
      fullName: 'Evenos Organizer',
      role: Role.ORGANIZER,
    },
  });

  await prisma.user.upsert({
    where: { id: attendeeId },
    update: {
      email: attendeeEmail,
      password: hashedAttendee,
      fullName: 'Evenos Attendee',
      role: Role.ATTENDEE,
    },
    create: {
      id: attendeeId,
      email: attendeeEmail,
      password: hashedAttendee,
      fullName: 'Evenos Attendee',
      role: Role.ATTENDEE,
    },
  });

  const events = [
    {
      id: 'evt_sai_gon_music_night_2026',
      title: 'Sai Gon Music Night 2026',
      description:
        'Một đêm nhạc live tại trung tâm thành phố với dàn nghệ sĩ khách mời.\n\n- Check-in sớm nhận quà\n- Khu vực F&B\n- Vé điện tử (QR)\n\nLưu ý: Không mang đồ ăn, nước uống từ bên ngoài.',
      location: 'Nhà Văn Hóa Thanh Niên, TP.HCM',
      startDate: new Date('2026-05-10T19:30:00+07:00'),
      endDate: new Date('2026-05-10T22:30:00+07:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=2000&q=80',
      category: 'Âm nhạc',
      isPublished: true,
      creatorId: organizerId,
      tickets: [
        { id: 'tkt_sgm_vip', name: 'VIP', price: '1200000.00', capacity: 200 },
        { id: 'tkt_sgm_ga', name: 'GA', price: '450000.00', capacity: 1200 },
      ],
    },
    {
      id: 'evt_vietnam_food_festival_2026',
      title: 'Vietnam Food Festival 2026',
      description:
        'Lễ hội ẩm thực với hơn 60 gian hàng.\n\n- Workshop nấu ăn\n- Khu vực trẻ em\n- Vé vào cổng theo khung giờ',
      location: 'Công viên 23/9, TP.HCM',
      startDate: new Date('2026-05-24T09:00:00+07:00'),
      endDate: new Date('2026-05-24T21:00:00+07:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=2000&q=80',
      category: 'Lễ hội',
      isPublished: true,
      creatorId: organizerId,
      tickets: [
        { id: 'tkt_food_early', name: 'Early Bird', price: '59000.00', capacity: 1500 },
        { id: 'tkt_food_standard', name: 'Standard', price: '89000.00', capacity: 4000 },
      ],
    },
    {
      id: 'evt_product_design_day_2026',
      title: 'Product Design Day',
      description:
        'Sự kiện dành cho designer và PM.\n\n- 8 talks\n- Networking lounge\n- Goodie bag',
      location: 'Rex Hotel, Quận 1, TP.HCM',
      startDate: new Date('2026-06-06T08:30:00+07:00'),
      endDate: new Date('2026-06-06T17:30:00+07:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=2000&q=80',
      category: 'Hội thảo',
      isPublished: true,
      creatorId: organizerId,
      tickets: [
        { id: 'tkt_pdd_student', name: 'Student', price: '199000.00', capacity: 300 },
        { id: 'tkt_pdd_standard', name: 'Standard', price: '499000.00', capacity: 800 },
      ],
    },
    {
      id: 'evt_standup_comedy_2026',
      title: 'Standup Comedy Night',
      description:
        'Đêm diễn standup với line-up khách mời.\n\n- Doors open 19:00\n- Show starts 20:00',
      location: 'Nhà hát Bến Thành, TP.HCM',
      startDate: new Date('2026-06-14T20:00:00+07:00'),
      endDate: new Date('2026-06-14T22:00:00+07:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2000&q=80',
      category: 'Giải trí',
      isPublished: true,
      creatorId: organizerId,
      tickets: [
        { id: 'tkt_comedy_front', name: 'Front Row', price: '650000.00', capacity: 120 },
        { id: 'tkt_comedy_ga', name: 'GA', price: '280000.00', capacity: 600 },
      ],
    },
    {
      id: 'evt_marathon_training_2026',
      title: 'Marathon Training Camp',
      description:
        'Camp tập luyện 1 ngày cùng HLV.\n\n- Chạy kỹ thuật\n- Dinh dưỡng\n- Phục hồi',
      location: 'Sala City Park, TP.Thủ Đức',
      startDate: new Date('2026-06-21T06:00:00+07:00'),
      endDate: new Date('2026-06-21T12:00:00+07:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=2000&q=80',
      category: 'Thể thao',
      isPublished: true,
      creatorId: organizerId,
      tickets: [
        { id: 'tkt_run_standard', name: 'Standard', price: '349000.00', capacity: 500 },
        { id: 'tkt_run_plus', name: 'Standard+', price: '499000.00', capacity: 200 },
      ],
    },
    {
      id: 'evt_art_exhibition_2026',
      title: 'Art Exhibition: Neon Bloom',
      description:
        'Triển lãm nghệ thuật đương đại.\n\n- Vé theo lượt\n- Có hướng dẫn tham quan',
      location: 'The Factory Contemporary Arts Centre, Quận 2',
      startDate: new Date('2026-07-04T10:00:00+07:00'),
      endDate: new Date('2026-07-04T20:00:00+07:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=2000&q=80',
      category: 'Triển lãm',
      isPublished: true,
      creatorId: organizerId,
      tickets: [
        { id: 'tkt_art_standard', name: 'Standard', price: '129000.00', capacity: 1500 },
      ],
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        imageUrl: event.imageUrl,
        category: event.category,
        isPublished: event.isPublished,
        creatorId: event.creatorId,
      },
      create: {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        imageUrl: event.imageUrl,
        category: event.category,
        isPublished: event.isPublished,
        creatorId: event.creatorId,
      },
    });

    for (const ticket of event.tickets) {
      await prisma.ticketType.upsert({
        where: { id: ticket.id },
        update: {
          name: ticket.name,
          price: ticket.price as any,
          capacity: ticket.capacity,
          available: ticket.capacity,
          eventId: event.id,
        },
        create: {
          id: ticket.id,
          name: ticket.name,
          price: ticket.price as any,
          capacity: ticket.capacity,
          available: ticket.capacity,
          eventId: event.id,
        },
      });
    }
  }

  // Ensure no dangling tickets from older seeds (optional cleanup).
  // Keeping it conservative: we only delete tickets that belong to seeded event IDs but are not in the current list.
  const seededEventIds = events.map((event) => event.id);
  const seededTicketIds = events.flatMap((event) => event.tickets.map((ticket) => ticket.id));

  await prisma.ticketType.deleteMany({
    where: {
      eventId: { in: seededEventIds },
      id: { notIn: seededTicketIds },
    },
  });

  console.log('Seed completed.');
  console.log('Demo accounts:');
  console.log(`- Organizer: ${organizerEmail} / ${organizerPassword}`);
  console.log(`- Attendee : ${attendeeEmail} / ${attendeePassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

