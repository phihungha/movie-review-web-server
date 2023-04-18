import { Gender, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prismaClient = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('12345678', salt);

  const regular1 = await prismaClient.regularUser.create({
    data: {
      user: {
        create: {
          name: 'John User',
          username: 'john',
          email: 'john@gmail.com',
          dateOfBirth: new Date(1978, 5, 4),
          gender: Gender.Male,
          hashedPassword,
        },
      },
    },
  });

  const regular2 = await prismaClient.regularUser.create({
    data: {
      user: {
        create: {
          name: 'Katy User',
          username: 'katy',
          email: 'katy@gmail.com',
          dateOfBirth: new Date(2002, 1, 10),
          gender: Gender.Female,
          hashedPassword,
        },
      },
    },
  });

  const critic1 = await prismaClient.criticUser.create({
    data: {
      blogUrl: 'www.rogereberts.com',
      user: {
        create: {
          name: 'Roger Ebert',
          username: 'ebert',
          email: 'ebert@gmail.com',
          dateOfBirth: new Date(1971, 1, 4),
          gender: Gender.Male,
          hashedPassword,
        },
      },
    },
  });

  await prismaClient.genre.createMany({
    data: [
      {
        name: 'Sci-fi',
      },
      {
        name: 'Thriller',
      },
      {
        name: 'Crime',
      },
    ],
  });

  await prismaClient.company.createMany({
    data: [
      {
        name: 'Warner Bros',
      },
      {
        name: 'TriBeCa Productions',
      },
      {
        name: 'Legendary',
      },
      {
        name: 'Netflix',
      },
    ],
  });

  const scorsese = await prismaClient.crewMember.create({
    data: { name: 'Martin Scorsese' },
  });

  const zaillian = await prismaClient.crewMember.create({
    data: { name: 'Steven Zaillian' },
  });

  const niro = await prismaClient.crewMember.create({
    data: { name: 'Robert De Niro' },
  });

  const villeneuve = await prismaClient.crewMember.create({
    data: { name: 'Denis Villeneuve' },
  });

  const movie1 = await prismaClient.movie.create({
    data: {
      title: 'The Irishman',
      releaseDate: new Date(2019, 9, 27),
      genres: { connect: [{ name: 'Crime' }, { name: 'Thriller' }] },
      productionCompanies: { connect: { name: 'TriBeCa Productions' } },
      distributionCompanies: { connect: { name: 'Netflix' } },
      directors: { connect: { id: scorsese.id } },
      writers: { connect: { id: zaillian.id } },
      actors: {
        create: {
          crew: { connect: { id: niro.id } },
          characterName: 'Frank Sheeran',
        },
      },
      userReviewCount: 2,
      criticReviewCount: 1,
      userScore: 8.5,
      criticScore: 9,
      viewedUsers: {
        connect: [{ id: regular1.id }, { id: regular2.id }, { id: critic1.id }],
      },
      viewedUserCount: 3,
    },
  });

  const movie2 = await prismaClient.movie.create({
    data: {
      title: 'Dune',
      releaseDate: new Date(2021, 10, 22),
      genres: { connect: { name: 'Sci-fi' } },
      productionCompanies: {
        connect: [{ name: 'Legendary' }, { name: 'Warner Bros' }],
      },
      distributionCompanies: { connect: { name: 'Warner Bros' } },
      directors: { connect: { id: villeneuve.id } },
      userReviewCount: 0,
      criticReviewCount: 1,
      userScore: 9,
      criticScore: 8,
      viewedUsers: {
        connect: [{ id: critic1.id }],
      },
      viewedUserCount: 1,
    },
  });

  await prismaClient.review.create({
    data: {
      authorId: regular1.id,
      movieId: movie1.id,
      title: 'Very good film',
      score: 9,
      content: 'This film is peak fiction',
      thankCount: 2,
      thankUsers: { connect: [{ id: regular2.id }, { id: critic1.id }] },
    },
  });

  await prismaClient.review.create({
    data: {
      authorId: regular2.id,
      movieId: movie1.id,
      title: 'Good',
      score: 8,
      content: 'OK film I guess',
      thankCount: 0,
    },
  });

  await prismaClient.review.create({
    data: {
      authorId: critic1.id,
      movieId: movie1.id,
      title: 'Best movie ever',
      score: 8,
      content: 'Martin Scorsese is at his best in this movie.',
      thankCount: 1,
      thankUsers: { connect: { id: regular1.id } },
    },
  });

  await prismaClient.review.create({
    data: {
      authorId: critic1.id,
      movieId: movie2.id,
      title: 'Entertaining',
      score: 8,
      content: 'A great blockbuster.',
      thankCount: 2,
      thankUsers: { connect: [{ id: regular1.id }, { id: regular2.id }] },
    },
  });
}

main()
  .then(async () => await prismaClient.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prismaClient.$disconnect();
  });
