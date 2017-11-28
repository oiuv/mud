inherit ROOM;
 
void create()
{
        set("short", "圣姑堂");
        set("long", @LONG
这里是黑木崖的「圣姑」任盈盈所在的圣姑堂。堂上五彩
云罗，煞是漂亮。堂中座有一位妙龄女子，青衫小袖，明艳不
可方物，含笑不怒而威。
LONG );
        set("exits", ([
            	"east" : __DIR__"chitang",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/ying" : 1,
        ]));       
        setup();
        replace_program(ROOM);
}
