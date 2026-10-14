// Card de projeto com a luz especular do SpecularButton:
// a borda brilha do lado de onde o rato se aproxima.
import { useSpecularLight } from './useSpecularLight';
import './SpecularCard.css';

const SpecularCard = ({
  children,
  href,
  radius = 24,
  lineColor = '#ffffff',
  baseColor = '#3a3f4a',
  idleIntensity = 0.25,
  shineSize = 8,
  shineFade = 30,
  thickness = 1.2,
  glow = 1,
  proximity = 220,
  className = '',
  ...rest
}) => {
  const { elementRef, canvasRef } = useSpecularLight({
    radius, lineColor, baseColor, idleIntensity, shineSize, shineFade, thickness, glow, proximity
  });
  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      ref={elementRef}
      href={href}
      className={`specular-card${className ? ` ${className}` : ''}`}
      style={{ '--sc-radius': `${radius}px` }}
      {...rest}
    >
      <canvas ref={canvasRef} className="specular-card__light" aria-hidden="true" />
      <div className="specular-card__content">{children}</div>
    </Tag>
  );
};

export default SpecularCard;
