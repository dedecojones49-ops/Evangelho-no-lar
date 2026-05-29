'use client';

import React, { useState } from 'react';
import { Video, MessageCircle, Users, Zap, Star, Calendar, Play, Flame, Sliders } from 'lucide-react';
import Link from 'next/link';

interface Testimony {
  name: string;
  role: string;
  text: string;
  image: string;
}

interface UpcomingMeeting {
  date: string;
  time: string;
  title: string;
  description: string;
  participants: number;
  roomId: string;
}

interface Recording {
  title: string;
  date: string;
  duration: string;
  thumbnail: string;
  views: number;
}

interface LandingProps {
  onStart: (groupMode?: boolean) => void;
}

// Inline lightweight Button custom-styled components to avoid missing shadcn dependencies
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const Button = ({ variant = 'default', className = '', ...props }: ButtonProps) => {
  if (variant === 'outline') {
    return (
      <button
        className={`border-2 border-white text-white hover:bg-white/20 rounded-full px-8 py-4 text-base font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95 ${className}`}
        {...props}
      />
    );
  }
  return (
    <button
      className={`bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 rounded-full px-8 py-4 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50 active:scale-95 ${className}`}
      {...props}
    />
  );
};

export default function Landing({ onStart }: LandingProps) {
  const [selectedTestimony, setSelectedTestimony] = useState(0);

  const testimonies: Testimony[] = [
    {
      name: 'Padre João Silva',
      role: 'Pároco - Paróquia São Francisco',
      text: 'O Evangelho no Lar transformou nossas reuniões de oração. A qualidade de vídeo é excelente e o chat facilita a comunicação. Recomendo muito!',
      image: '👨🙏',
    },
    {
      name: 'Irmã Maria Santos',
      role: 'Coordenadora de Grupos de Estudo',
      text: 'Conseguimos conectar pessoas de diferentes cidades em nossas sessões de estudo bíblico. A gravação automática é perfeita para quem perde a reunião ao vivo.',
      image: '👩🙏',
    },
    {
      name: 'Comunidade Cristo Ressuscitado',
      role: 'Grupo de Oração',
      text: 'Sem limite de participantes, sem necessidade de login. É exatamente o que precisávamos para nossas reuniões semanais. Muito prático!',
      image: '🙏',
    },
  ];

  const upcomingMeetings: UpcomingMeeting[] = [
    {
      date: '28 de Maio',
      time: '19:00',
      title: 'Oração Noturna',
      description: 'Momento de oração e contemplação',
      participants: 45,
      roomId: 'luz-noturna'
    },
    {
      date: '30 de Maio',
      time: '15:00',
      title: 'Estudo Bíblico',
      description: 'Leitura e reflexão do Evangelho',
      participants: 62,
      roomId: 'estudo-kardec'
    },
    {
      date: '02 de Junho',
      time: '20:00',
      title: 'Celebração Comunitária',
      description: 'Encontro festivo com música e comunhão',
      participants: 120,
      roomId: 'celebracao-comunidade'
    },
  ];

  const recordings: Recording[] = [
    {
      title: 'Oração de Abertura - 25/05',
      date: '25 de Maio, 2026',
      duration: '45 min',
      thumbnail: '🎥',
      views: 234,
    },
    {
      title: 'Estudo: Parábola do Semeador',
      date: '23 de Maio, 2026',
      duration: '1h 20min',
      thumbnail: '📖',
      views: 567,
    },
    {
      title: 'Meditação Matinal',
      date: '21 de Maio, 2026',
      duration: '30 min',
      thumbnail: '🌅',
      views: 189,
    },
    {
      title: 'Celebração de Pentecostes',
      date: '19 de Maio, 2026',
      duration: '2h 15min',
      thumbnail: '✨',
      views: 892,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-stone-800">
      {/* Floating Header */}
      <nav className="absolute top-0 inset-x-0 z-30 flex justify-between items-center py-5 px-6 md:px-12 backdrop-blur-md bg-black/15">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="font-serif font-bold text-white text-sm sm:text-base tracking-wide">Evangelho no Lar</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/admin" className="text-white hover:text-amber-300 text-xs sm:text-sm font-semibold transition flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Painel</span> Admin
          </Link>
          <button 
            onClick={() => onStart(false)}
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer"
          >
            Sessão Local
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663505609800/KAS8dm6W2bKrSRv5fdoAcZ/frei-franciscano-hero-WeEaMgMEsna4iUgJSfz8x4.webp)',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-12">
          <div className="mb-8 inline-block select-none pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-4xl text-white font-serif font-bold">E</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-white mb-4 drop-shadow-md">
            Evangelho no Lar
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-amber-200 mb-6 drop-shadow-sm font-sans tracking-wide">
            Frei Betto de Cristo
          </p>

          <p className="text-sm sm:text-base md:text-lg text-white/95 mb-10 max-w-2xl mx-auto font-sans leading-relaxed drop-shadow-xs">
            Videoconferência em alta qualidade para grupos de estudo, oração e comunhão espiritual. Conecte-se com sua comunidade de fé em qualquer lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onStart(false)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 border border-transparent hover:shadow-xl transition-all"
            >
              Iniciar Reunião
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const sec = document.getElementById('features-section');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-white text-white hover:bg-white/20"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-6 bg-gradient-to-b from-white to-orange-50/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 text-stone-900">
            Recursos Principais
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Video className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-serif font-bold mb-3 text-stone-900">Vídeo em Mosaico</h3>
              <p className="text-sm text-stone-600 font-sans leading-relaxed">
                Visualize múltiplos participantes simultaneamente com layout responsivo e tela cheia automática para o palestrante.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <MessageCircle className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-serif font-bold mb-3 text-stone-900">Chat em Tempo Real</h3>
              <p className="text-sm text-stone-600 font-sans leading-relaxed">
                Comunique-se via texto durante a reunião com histórico de mensagens e suporte a emojis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-serif font-bold mb-3 text-stone-900">Convites Fáceis</h3>
              <p className="text-sm text-stone-600 font-sans leading-relaxed">
                Compartilhe links de reunião via WhatsApp, Email ou redes sociais. Sem necessidade de login.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-8 bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-serif font-bold mb-3 text-stone-900">Sem Limite de Tempo</h3>
              <p className="text-sm text-stone-600 font-sans leading-relaxed">
                Reuniões ilimitadas com servidor WebRTC gratuito. Qualidade de áudio e vídeo otimizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Meetings Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 text-stone-900">
            Próximas Reuniões
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {upcomingMeetings.map((meeting, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-50/40 to-orange-50/10 rounded-2xl p-8 border-2 border-amber-100 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Calendar className="text-amber-700" size={22} />
                    <div>
                      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">{meeting.date}</p>
                      <p className="text-base font-serif font-bold text-stone-900">{meeting.time}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{meeting.title}</h3>
                  <p className="text-sm text-stone-600 mb-6 leading-relaxed">{meeting.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-amber-100/60 mt-auto">
                  <span className="text-xs text-stone-500 font-medium">
                    👥 {meeting.participants} inscritos
                  </span>
                  <Link 
                    href={`/conference?room=${meeting.roomId}`}
                    className="bg-amber-800 hover:bg-amber-700 text-white rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Participar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recordings Gallery Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-emerald-50/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 text-stone-900">
            Reuniões Anteriores
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recordings.map((recording, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden border border-amber-100/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => onStart(false)}
              >
                <div className="relative aspect-video bg-amber-50 flex items-center justify-center overflow-hidden">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{recording.thumbnail}</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={40} />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-bold text-sm text-stone-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
                    {recording.title}
                  </h3>
                  <p className="text-xs text-stone-500 mb-3">
                    {recording.date} • {recording.duration}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400 font-medium">
                      👁️ {recording.views} visualizações
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-emerald-50/40 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 text-stone-900">
            O Que Dizem Sobre Nós
          </h2>

          <div className="bg-gradient-to-br from-[#FAF8F5] to-amber-50/30 rounded-3xl p-8 md:p-12 shadow-sm border border-[#E6DEC9]">
            <div className="flex items-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-amber-500 fill-amber-500" size={20} />
              ))}
            </div>

            <p className="text-lg md:text-xl font-serif text-stone-800 mb-8 italic leading-relaxed">
              &ldquo;{testimonies[selectedTestimony].text}&rdquo;
            </p>

            <div className="flex items-center gap-4">
              <div className="text-4xl bg-amber-100/60 p-2.5 rounded-full select-none">{testimonies[selectedTestimony].image}</div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  {testimonies[selectedTestimony].name}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {testimonies[selectedTestimony].role}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-8 justify-center">
              {testimonies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTestimony(index)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    index === selectedTestimony
                      ? 'bg-amber-700 w-6'
                      : 'bg-stone-200 hover:bg-stone-300'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-5">
            Pronto para Conectar?
          </h2>
          <p className="text-base sm:text-lg text-amber-50/95 mb-8 leading-relaxed">
            Comece sua reunião agora mesmo. Não é necessário criar uma conta ou fazer download.
          </p>
          <button
            onClick={() => onStart(true)}
            className="bg-white text-orange-700 hover:bg-stone-50 rounded-full px-10 py-4 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Iniciar Reunião Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8 border-b border-stone-850 pb-8">
            <div>
              <h3 className="font-serif text-white font-bold text-base mb-4">Evangelho no Lar</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Conectando comunidades de fé através da tecnologia e sintonizando pensamentos de paz.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-white font-bold text-sm mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features-section" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a onClick={() => onStart(true)} className="hover:text-white transition-colors cursor-pointer">Círculo Virtual</a></li>
                <li><a onClick={() => onStart(false)} className="hover:text-white transition-colors cursor-pointer">Sessão Local</a></li>
                <li><Link href="/admin" className="hover:text-white transition-colors cursor-pointer">Painel Administrador</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-white font-bold text-sm mb-4">Parcerias</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Desenvolvido em amor fraterno para incentivar a prece, meditação diária e o Evangelho de Jesus em todas as famílias.
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-stone-600">
            <p>&copy; 2026 Evangelho no Lar - Frei Betto de Cristo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
