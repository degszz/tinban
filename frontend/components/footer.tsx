import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full text-serif flex flex-col justify-between h-[300px] md:h-[250px] text-black">
      <div className="min-h-[150px] flex justify-center">
        <div className="text-start lg:text-left max-w-[350px] md:max-w-none lg:min-w-[800px]">
          <div className="w-full py-6">
            <div>
              <h4 className="text-2xl font-sans">
                <strong>Contactanos</strong>
              </h4>
              <div className="flex flex-col">
                <span>📱 <strong>Tel:</strong> +54 9 11 3074-4578</span>
                <span>📧 <strong>Email:</strong> horaciotinban@gmail.com</span>
                <span>📍 <strong>CABA, Buenos Aires</strong></span>
              </div>
            </div>
            <div className="my-4 lg:mb-0 flex gap-2">
              <Link
                href="https://www.facebook.com/profile.php?id=61584653608264"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 bg-white transition-all duration-200 ease-in-out scale-90 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none"
              >
                <Facebook className="w-6 h-6 text-[#4362AE]" />
              </Link>
              <Link
                href="https://www.instagram.com/mandadosahora/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 bg-white transition-all duration-200 ease-in-out scale-90 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none"
              >
                <Instagram className="w-6 h-6 text-[#C72785]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[50px] w-full border-t-2 border-kai-950 flex justify-center items-center">
        <p>
          <strong>Tinban Remates ©™</strong>
        </p>
      </div>
    </footer>
  );
}