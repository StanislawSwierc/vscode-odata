root
  = _ select:select error:error? { 
    return { root: select, error: error}; 
  }

select 
  = '$select' _ EQ _ head:selectItem _ tail:(COMMA _ selectItem _)* {
  	var items = tail.map(function(x) { return x[3]; });
    items.splice(0, 0, head);
    return {
        kind: "Select",
        span: location(),
        children: items,
    } 
  }

selectItem 
  = selectProperty

selectProperty
  = primitiveProperty  
//  / primitiveColProperty 
//  / navigationProperty
//  / selectPath ( "/" selectProperty )?

primitiveProperty 
  = identifier:odataIdentifier {
    return {
      kind: "PrimitiveProperty",
      span: location(),
      propertyName: identifier
    };
  }

odataIdentifier = $( identifierLeadingCharacter identifierCharacter* )
identifierLeadingCharacter = ALPHA / "_" // plus Unicode characters from the categories L or Nl
identifierCharacter = ALPHA / "_" / DIGIT // plus Unicode characters from the categories L, Nl, Nd, Mn, Mc, Pc, or Cf
 		

error 
  = text:$.+ {
	  return { kind: "Error", span: location() };
  }

_ "trivia" = (whitespace / comment)*
whitespace = [ \t\n\r]+
comment = "//" [^\n\r]*
  
RWS = ( SP / HTAB / "%20" / "%09" )+ // "required" whitespace 
BWS = ( SP / HTAB / "%20" / "%09" )* // "bad" whitespace 

AT     = "@" / "%40"
COLON  = ":" / "%3A"
COMMA  = "," / "%2C"
EQ     = "="
SIGN   = "+" / "%2B" / "-"
SEMI   = ";" / "%3B"
STAR   = "*" / "%2A"
SQUOTE = "'" / "%27"

OPEN  = "(" / "%28"
CLOSE = ")" / "%29"


//------------------------------------------------------------------------------
// C. ABNF core definitions [RFC5234]
//------------------------------------------------------------------------------

ALPHA  = [A-Za-z] 
DIGIT  = [0-9] 
HEXDIG = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
DQUOTE = "\""
SP     = " " 
HTAB   = "\t" 
//;WSP    = SP / HTAB 
//;LWSP = *(WSP / CRLF WSP) 
VCHAR = [!-~] 
//;CHAR = %x01-7F
//;LOCTET = %x00-FF 
//;CR     = %x0D 
//;LF     = %x0A 
//;CRLF   = CR LF
//;BIT = "0" / "1" 
