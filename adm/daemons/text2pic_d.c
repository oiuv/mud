#include <ansi.h>

#define HZK "/adm/etc/language/hzk"

#define ASC "/adm/etc/language/asc"

#define DEFAULT_FILL "¡ñ"

#define DEFAULT_BG "  "

#define DEFAULT_FCOLOR ""

#define DEFAULT_BGCOLOR ""

#define AUTO_SIZE 12



varargs string Display(string str, int size, string fill, string bg, string fcolor, string bgcolor)

{

        int offset;

        int *mask = ({0x80, 0x40, 0x20, 0x10, 0x8, 0x4, 0x2, 0x1});

        int scale;

        string char;

        string *out;

        

        if(!size)

#ifdef AUTO_SIZE

                size = AUTO_SIZE;

#else

                error("TEXT to PIC need size\n");

#endif

        out = allocate(size);

        out = map_array(out, (: $1 = "" :));

        size *= 2;



        if(!fill || sizeof(fill) != sizeof(bg)) fill = DEFAULT_FILL;

        if(!fcolor) fcolor = DEFAULT_FCOLOR;

        if(!bg || sizeof(fill) != sizeof(bg)) bg = DEFAULT_BG;

        if(!bgcolor) bgcolor = DEFAULT_BGCOLOR;



        for(int k = 0; k < sizeof(str); k++) {

                if(mask[0] & str[k]) {

                        offset = size*( (atoi(sprintf("%d", str[k]))-0xA1)*94 + atoi(sprintf("%d", str[k+1])) - 0xA1 );

                        char = read_bytes(HZK + (size/2), offset, size);

                        k++;

                        scale = 2;

                } else {

                        offset = str[k] * (size/2);

                        char = read_bytes(ASC + (size/2), offset, (size/2));

                        scale = 1;

                }



                if(!sizeof(char)) error("TEXT to PIC can't read bytes from character lib\n");



                for(int i = 0; i < sizeof(char); i++) {

                        for(int j = 0; j < 8; j++) {

                                if(mask[j] & char[i]) 

                                        out[i/scale] += fcolor + fill;

                                else 

                                        out[i/scale] += bgcolor + bg;

                        }

                }



                for(int i = 0; i < sizeof(out); i++) {

                        out[i] = replace_string(out[i], fill + fcolor + fill, fill + fill);

                        out[i] = replace_string(out[i], bg + bgcolor + bg, bg + bg);

                }

        }

        

        return implode(out, "\n") + NOR;

}

