import Image from "next/image";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-primary/70">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <ul className="mt-12 flex justify-center items-center gap-6 md:gap-8">
          <li>
            <a
              href="https://www.facebook.com/elqema.chem"
              rel="noreferrer"
              target="_blank"
            >
              <span className="sr-only">Facebook</span>
              <Image
                src="/icons/facebook.svg"
                height={50}
                width={50}
                alt="facebook"
              />
            </a>
          </li>

          <li>
            <a
              href="https://www.instagram.com/elqema.chem/"
              rel="noreferrer"
              target="_blank"
            >
              <span className="sr-only">Instagram</span>
              <Image
                src="/icons/instagram.svg"
                height={50}
                width={50}
                alt="instagram"
              />
            </a>
          </li>

          <li>
            <a
              href="https://www.tiktok.com/@elqema.chem"
              rel="noreferrer"
              target="_blank"
            >
              <span className="sr-only">Tiktok</span>
              <Image
                src="/icons/tiktok.svg"
                height={50}
                width={50}
                alt="tiktok"
              />
            </a>
          </li>

          <li>
            <a
              href="https://www.youtube.com/@el-qema"
              rel="noreferrer"
              target="_blank"
            >
              <span className="sr-only">Youtube</span>
              <Image
                src="/icons/youtube.svg"
                height={50}
                width={50}
                alt="youtube"
              />
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/201118623230"
              rel="noreferrer"
              target="_blank"
            >
              <span className="sr-only">Whatsapp</span>
              <Image
                src="/icons/whatsapp.png"
                height={70}
                width={70}
                alt="youtube"
                className="rounded-full w-[50px] h-[50px] object-cover"
              />
            </a>
          </li>
        </ul>
        <div className="text-center mt-5 text-xl text-white flex items-center gap-3 justify-center">
          <p>تم انشاء هذه المنصة بواسطة</p>
          <a href="https://wa.me/201015380754" target="_blank">
            <Image
              src="/img/teacherlogo.png"
              width={100}
              height={100}
              alt="Teacher for the future"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
