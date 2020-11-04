import * as A from "fp-ts/lib/Array";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe, flow } from "fp-ts/lib/function";

export type sellPage = {
  shopName: string;
  price: number;
  url: string;
};

export type thumbnail = {
  large: string;
};

export type Product = sellPage & {
  thumbnail: thumbnail;
};

const getSellPages = (): Promise<sellPage[]> => {
  return Promise.resolve([
    {
      shopName: "hogehoge",
      price: 1000,
      url: "",
    },
  ]);
};

const getThumbnail = (sellPage: sellPage): Promise<thumbnail> => {
  return Promise.resolve({
    large: "http://....",
  });
};

const safeGetSellPages = (): TE.TaskEither<Error, sellPage[]> => {
  return TE.tryCatch(
    () => {
      return new Promise<sellPage[]>(async (resolve) => {
        resolve(await getSellPages());
      });
    },
    (reason) => new Error(String(reason))
  );
};

const safeGetProduct = (sellPage: sellPage): TE.TaskEither<Error, Product> => {
  return TE.tryCatch(
    () => {
      return new Promise<Product>(async (resolve) => {
        resolve({
          ...sellPage,
          thumbnail: await getThumbnail(sellPage),
        });
      });
    },
    (reason) => new Error(String(reason))
  );
};

const products = pipe(
  safeGetSellPages(),
  TE.chain(
    flow(
      A.map((sellPage) => safeGetProduct(sellPage)),
      A.array.sequence(TE.taskEither)
    )
  ),
  TE.getOrElse(() => T.of<Product[]>([]))
);

console.log(products());
