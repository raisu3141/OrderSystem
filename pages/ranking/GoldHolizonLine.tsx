import React, { CSSProperties } from 'react';

/** Propsの型定義 */
interface PropsType {
  style?: CSSProperties;
}

const GoldHolizonLine = (props: PropsType) => {
    const defaultStyle = {
      width: "95%" ,
      height: "0.7vw",
      backgroundColor: "#e6b422",
    } as CSSProperties;
  
    return <div style={props.style ? props.style : defaultStyle}></div>;
  };

export default GoldHolizonLine;