inherit ROOM;

void create()
{
        set("short", "后堂");
        set("long", @LONG
绝情谷后堂摆放着各种珍奇的古董和陶瓷，正中靠墙处的
柜子上供着一尊泥像，泥像下轻烟缭绕，想必是绝情谷开山祖
师的灵位。
LONG);
        set("exits", ([
               "west"   : __DIR__"zhifang",
               "north"   : __DIR__"jianshi",
               "east"   : __DIR__"chucangshi",
               "south"   : __DIR__"changlang4",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

