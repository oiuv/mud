inherit ROOM;

void create()
{
        set("short", "画廊");
        set("long", @LONG
这是一条非常精美的长廊，柱子和栏杆是用华贵的紫檀木
制成，上面雕饰着美丽的图画，画工精巧，美不胜收。地板不
知是用什么材料做的，走在上面毫无声息，你只感到脚下软软
的，非常舒服。走廊东面是憩凤阁，是灵鹫宫弟子休息的地方。
LONG);
        set("exits", ([
                "east" : __DIR__"restroom",
                "west" : __DIR__"changl2",
                "north" : __DIR__"changl10",
                "south" : __DIR__"changl4",
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}