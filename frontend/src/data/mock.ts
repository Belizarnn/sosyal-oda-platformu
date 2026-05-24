import type { OnlineFriend, Room, SuggestedActivity, TrendingRoom, User } from "./types";
import { ROOM_CATEGORIES } from "./types";

export const currentUser: User = {
  id: "u1",
  username: "Ayşe Yılmaz",
  handle: "ayse",
  email: "ayse@ornek.com",
  bio: "Gece kuşu · Film geceleri ve ders odalarında takılırım.",
  avatarColor: "#7c6cf0",
  interests: ["Film", "Yazılım", "Lo-fi", "Valorant"],
  presenceStatus: "ONLINE",
  statusMessage: "Bugün rahat mod",
  badges: ["Erken Kullanıcı", "Watch Party"],
};

export const users: User[] = [
  currentUser,
  {
    id: "u2",
    username: "Mehmet Kaya",
    handle: "mehmetk",
    email: "mehmet@ornek.com",
    bio: "Oyun ve müzik odalarının vazgeçilmezi.",
    avatarColor: "#5b9bd5",
    interests: ["Oyun", "Müzik", "E-spor"],
    presenceStatus: "GAMING",
    statusMessage: "Ranked arıyor",
    badges: ["Oda Kurucusu"],
  },
  {
    id: "u3",
    username: "Duygu",
    handle: "duygu",
    email: "duygu@ornek.com",
    bio: "Anime ve gece sohbetleri.",
    avatarColor: "#e879a9",
    interests: ["Anime", "Sohbet"],
    presenceStatus: "WATCHING",
    statusMessage: "Anime gecesi",
    badges: [],
  },
  {
    id: "u4",
    username: "Can Arslan",
    handle: "canarslan",
    email: "can@ornek.com",
    bio: "Full-stack öğreniyorum, birlikte kod yazalım.",
    avatarColor: "#34d399",
    interests: ["Yazılım", "Ders", "React"],
    presenceStatus: "STUDYING",
    statusMessage: "Matematik çalışıyorum",
    badges: ["Study Buddy"],
  },
  {
    id: "u5",
    username: "Elif Öztürk",
    handle: "elifo",
    email: "elif@ornek.com",
    bio: "Spor maçları ve sohbet — ikisi birden.",
    avatarColor: "#fbbf24",
    interests: ["Spor", "Sohbet", "Futbol"],
    presenceStatus: "IN_ROOM",
    statusMessage: "Maç yorumluyor",
    badges: [],
  },
  {
    id: "u6",
    username: "Burak Şen",
    handle: "buraks",
    email: "burak@ornek.com",
    bio: "Lo-fi dinlerken kod yazarım.",
    avatarColor: "#a78bfa",
    interests: ["Müzik", "Yazılım", "Lo-fi"],
    presenceStatus: "LISTENING",
    statusMessage: "Gece lo-fi",
    badges: [],
  },
];

export const rooms: Room[] = [
  {
    id: "r1",
    name: "Gece Lo-fi & Sohbet",
    description: "Rahat bir akşam, lo-fi müzik eşliğinde sohbet.",
    category: "Müzik",
    memberCount: 18,
    maxMembers: 30,
    isActive: true,
    hostHandle: "buraks",
    tags: ["lo-fi", "rahat", "gece"],
  },
  {
    id: "r2",
    name: "Valorant Takım Kurma",
    description: "Ranked için takım arayanlar buraya.",
    category: "Oyun",
    memberCount: 5,
    maxMembers: 5,
    isActive: true,
    hostHandle: "mehmetk",
    tags: ["valorant", "ranked"],
  },
  {
    id: "r3",
    name: "Film Gecesi: Sci-Fi",
    description: "Birlikte bilim kurgu filmi izliyoruz.",
    category: "Film",
    memberCount: 12,
    maxMembers: 25,
    isActive: true,
    hostHandle: "ayse",
    tags: ["watch-party", "sci-fi"],
  },
  {
    id: "r4",
    name: "React Çalışma Odası",
    description: "Pomodoro ile birlikte frontend çalışıyoruz.",
    category: "Ders",
    memberCount: 8,
    maxMembers: 15,
    isActive: true,
    hostHandle: "canarslan",
    tags: ["pomodoro", "react"],
  },
  {
    id: "r5",
    name: "Anime Bölüm İzleme",
    description: "Haftalık anime bölümü birlikte.",
    category: "Anime",
    memberCount: 22,
    maxMembers: 40,
    isActive: true,
    hostHandle: "duygu",
    tags: ["anime", "watch-party"],
  },
  {
    id: "r6",
    name: "Derin Sohbet Köşesi",
    description: "Sakin tempoda, anlamlı sohbetler.",
    category: "Sohbet",
    memberCount: 6,
    maxMembers: 12,
    isActive: true,
    hostHandle: "elifo",
    tags: ["sakin", "sohbet"],
  },
  {
    id: "r7",
    name: "TypeScript Atölyesi",
    description: "Tip güvenli kod yazma pratiği.",
    category: "Yazılım",
    memberCount: 10,
    maxMembers: 20,
    isActive: true,
    hostHandle: "canarslan",
    tags: ["typescript", "pair-programming"],
  },
  {
    id: "r8",
    name: "Şampiyonlar Ligi Maçı",
    description: "Canlı maç yorumu ve tribün modu.",
    category: "Spor",
    memberCount: 34,
    maxMembers: 50,
    isActive: true,
    hostHandle: "elifo",
    tags: ["futbol", "canlı"],
  },
  {
    id: "r9",
    name: "Sabah Kahvesi Sohbeti",
    description: "Günaydın mesajları ve hafif sohbet.",
    category: "Sohbet",
    memberCount: 4,
    maxMembers: 15,
    isActive: false,
    hostHandle: "ayse",
    tags: ["sabah", "rahat"],
  },
];

export const categories = [...ROOM_CATEGORIES];

export const trendingRooms: TrendingRoom[] = [
  { room: rooms[7], trendScore: 98 },
  { room: rooms[4], trendScore: 91 },
  { room: rooms[2], trendScore: 87 },
  { room: rooms[0], trendScore: 82 },
];

export const onlineFriends: OnlineFriend[] = [
  {
    id: "u2",
    username: "Mehmet Kaya",
    handle: "mehmetk",
    avatarColor: "#5b9bd5",
    presenceStatus: "GAMING",
    statusMessage: "Ranked arıyor",
  },
  {
    id: "u3",
    username: "Duygu",
    handle: "duygu",
    avatarColor: "#e879a9",
    presenceStatus: "WATCHING",
    statusMessage: "Anime gecesi",
  },
  {
    id: "u4",
    username: "Can Arslan",
    handle: "canarslan",
    avatarColor: "#34d399",
    presenceStatus: "STUDYING",
    statusMessage: "Matematik çalışıyorum",
  },
  {
    id: "u5",
    username: "Elif Öztürk",
    handle: "elifo",
    avatarColor: "#fbbf24",
    presenceStatus: "IN_ROOM",
    statusMessage: "Maç yorumluyor",
  },
  {
    id: "u6",
    username: "Burak Şen",
    handle: "buraks",
    avatarColor: "#a78bfa",
    presenceStatus: "LISTENING",
    statusMessage: "Gece lo-fi",
  },
];

export const suggestedActivity: SuggestedActivity = {
  title: "Film Gecesi: Sci-Fi",
  description: "Arkadaşların şu an izliyor — katılmak ister misin?",
  roomId: "r3",
};

export const recommendedRooms: Room[] = [
  rooms[3],
  rooms[6],
  rooms[1],
  rooms[5],
];

export function getUserByHandle(handle: string): User | undefined {
  return users.find((user) => user.handle === handle);
}

export function getRoomById(roomId: string): Room | undefined {
  return rooms.find((room) => room.id === roomId);
}

export function getActiveRooms(): Room[] {
  return rooms.filter((room) => room.isActive);
}
