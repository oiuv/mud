#include <ansi.h>
inherit ROOM;

string look_bei();

void create()
{
        set("short", "山边小路");
        set("long", @LONG
一条蜿蜒的小路延着山脚向前延伸，两旁是浓密的树林，脚下是
崎岖不平的山路，前面就是可怕的黑森林了。旁边似乎有一家山野小
店，路边有一座石碑(bei)。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "south" : __DIR__"milin1",
                "west" : __DIR__"xiaodian",
                "north" : __DIR__"road3",
        ]));

        set("item_desc",([
                "bei" : (: look_bei :),
        ]));

        setup();
}

string look_bei()
{
    return
    "\n"
              WHT "          ####################################\n"
                  "          ####                            ####\n"
                  "          ####        前方黑森林山高林    ####\n"
                  "          ####    密，百里之内不见人烟    ####\n"  
                  "          ####    有虎狼出没其中，行人    ####\n"  
                  "          ####    请三思而后行！          ####\n"  
                  "          ####                            ####\n"  
                  "          ####################################\n\n" NOR
    "\n";
}
