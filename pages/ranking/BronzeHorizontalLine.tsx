import React, { CSSProperties } from 'react';

/** Propsの型定義 */
interface PropsType {
  style?: CSSProperties;
}


  const BronzeHorizontalLine = (props: PropsType) => {
    const defaultStyle = {
      width: "95%",
      height: "0.7vw",
      backgroundColor: "#8c4841",
    } as CSSProperties;
  
    return <div style={props.style ? props.style : defaultStyle}></div>;
  };


export default BronzeHorizontalLine;