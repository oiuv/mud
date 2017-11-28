#include <room.h>
inherit ROOM;

void create()
{
        set("short", "岳坟");
        set("long", @LONG
墓道两旁有石虎，石羊，石马和三对翁仲。正中古柏交柯，便是
岳飞的坟墓。墓碑刻着“宋岳鄂王墓”。岳王墓的左面，便是岳飞之
子岳云的墓，墓碑上刻着“宋继忠侯岳云之墓”在岳坟前面两边四个
铁像(statue)。东首墙上有四个大字(word)。
LONG);
        set("exits", ([
            	"south"     : __DIR__"yuelang",
        ]));
        set("item_desc" , ([
            	"statue" : "北边两个是秦烩和他的妻子王氏，南边\n"
                           "两个是同谋杀害岳飞的奸臣，张俊和万\n"
                           "俟屑。四个铁像都反翦着手，向岳墓跪\n"
                           "着。\n",
            	"word"   : "墙上有“精忠报国”四个大字。这是岳\n"
                           "母当年训子时在岳飞背上刻的字。\n",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
