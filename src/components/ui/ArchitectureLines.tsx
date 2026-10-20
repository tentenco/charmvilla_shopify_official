// Original architectural studies: spiral galleries, a lattice dome, and glass planes.
// Decorative interpretations, not surveyed drawings or museum affiliations.
export default function ArchitectureLines({ variant = 0, className = "" }: { variant?: number; className?: string }) {
  return <svg className={`architecture-lines ${className}`} viewBox="0 0 1000 760" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <g opacity=".18">
        {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M ${80 + i * 70} 680 L ${620 + i * 70} 490 M ${190 + i * 110} 450 L ${730 + i * 110} 640`} />)}
      </g>
      {variant === 0 && <g className="architecture-volume">
        <path d="M180 559 344 500 849 556 685 627Z" fill="currentColor" fillOpacity=".025" />
        <path d="M235 544V402L368 355V493Z" fill="currentColor" fillOpacity=".05" />
        <path d="M235 402 368 355 456 390 320 438Z M320 438V578M235 544 320 578 456 530V390" />
        {Array.from({ length: 7 }, (_, i) => {
          const rx = 192 + i * 14, ry = 55 + i * 3.4, cy = 501 - i * 43;
          return <g key={i}>
            <path d={`M ${610 - rx} ${cy} a ${rx} ${ry} 0 0 0 ${rx * 2} 0 l -10 27 a ${rx - 10} ${ry - 3} 0 0 1 ${-2 * (rx - 10)} 0Z`} fill="currentColor" fillOpacity={i % 2 ? ".045" : ".075"} />
            <ellipse cx="610" cy={cy} rx={rx} ry={ry} />
            <path d={`M ${610 - rx + 11} ${cy + 10} a ${rx - 11} ${ry - 2} 0 0 0 ${2 * (rx - 11)} 0`} opacity=".5" />
          </g>;
        })}
        <ellipse cx="610" cy="243" rx="180" ry="48" />
        <ellipse cx="610" cy="243" rx="154" ry="38" />
        {Array.from({ length: 12 }, (_, i) => {
          const angle = i * Math.PI / 6;
          return <path key={i} d={`M${610 + Math.cos(angle) * 154} ${243 + Math.sin(angle) * 38}L${610 + Math.cos(angle) * 180} ${243 + Math.sin(angle) * 48}`} opacity=".5" />;
        })}
        <path d="M460 545v32m42-25v35m45-27v36m45-30v37m45-36v33m45-40v28m43-44v27" opacity=".55" />
      </g>}
      {variant === 1 && <g className="architecture-volume">
        <path d="M140 520 562 385 910 531 487 666Z" fill="currentColor" fillOpacity=".025" />
        {[0, 1, 2, 3].map(i => <g key={i} transform={`translate(${i * 125} ${i % 2 * 32})`}>
          <path d="M240 443 308 419 377 445 308 469Z M240 443V555L308 581V469 M308 581 377 555V445" fill="currentColor" fillOpacity=".055" />
          <path d="M265 516v47m18-40v47m46-42v45m18-52v45" opacity=".45" />
        </g>)}
        <path d="M155 398C215 114 819 114 885 398Q518 541 155 398Z" fill="currentColor" fillOpacity=".035" />
        <path d="M155 398Q520 580 885 398L883 414Q520 597 157 414Z" fill="currentColor" fillOpacity=".1" />
        {Array.from({ length: 15 }, (_, i) => {
          const x = 172 + i * 49;
          return <path key={i} d={`M${x} 405Q${520 + (x - 520) * .28} ${142 + Math.abs(x - 520) * .14} ${1040 - x} 405`} opacity=".72" />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10, rx = 365 * Math.sqrt(1 - (1 - t) ** 2), y = 195 + t * 202;
          return <path key={i} d={`M${520 - rx} ${y}Q520 ${y + t * 120} ${520 + rx} ${y}`} opacity=".6" />;
        })}
        <path d="M230 430v85m144-52v74m148-63v62m150-76v81m143-113v90" opacity=".5" />
      </g>}
      {variant === 2 && <g className="architecture-volume">
        <path d="M130 589 606 425 933 579 457 744Z" fill="currentColor" fillOpacity=".025" />
        <path d="M540 128 200 570 606 698Z" fill="currentColor" fillOpacity=".04" />
        <path d="M540 128 606 698 920 540Z" fill="currentColor" fillOpacity=".09" />
        {Array.from({ length: 13 }, (_, i) => {
          const t = (i + 1) / 14;
          return <g key={i} opacity=".75">
            <path d={`M${540 + (200 - 540) * t} ${128 + 442 * t}L${540 + 66 * t} ${128 + 570 * t}L${540 + 380 * t} ${128 + 412 * t}`} />
            <path d={`M540 128L${200 + 406 * t} ${570 + 128 * t} M540 128L${606 + 314 * t} ${698 - 158 * t}`} />
          </g>;
        })}
        <path d="M200 570v14l406 128 314-158v-14M606 698v14" />
      </g>}
    </g>
  </svg>;
}
