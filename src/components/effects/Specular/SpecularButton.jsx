// Botão com luz especular na borda (fornecido pelo Gonçalo).
// Com `href` passa a ser um link, com o mesmo efeito.
import { useSpecularLight } from './useSpecularLight';
import './SpecularButton.css';

const SpecularButton = ({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0.04,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  idleIntensity = 0.35,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.2,
  glow = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  href,
  onClick,
  className = '',
  type = 'button',
  style,
  ...rest
}) => {
  const { elementRef, canvasRef } = useSpecularLight({
    radius, lineColor, baseColor, intensity, idleIntensity, shineSize, shineFade,
    thickness, glow, speed, followMouse, proximity, autoAnimate, disabled
  });
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href } : { type, disabled };

  return (
    <Tag
      ref={elementRef}
      {...tagProps}
      onClick={onClick}
      className={`specular-button specular-button--${size}${className ? ` ${className}` : ''}`}
      style={{
        '--sb-radius': `${radius}px`,
        '--sb-tint': tint,
        '--sb-tint-opacity': tintOpacity,
        '--sb-blur': `${blur}px`,
        '--sb-text-color': textColor,
        ...style
      }}
      {...rest}
    >
      <canvas ref={canvasRef} className="specular-button__light" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </Tag>
  );
};

export default SpecularButton;
