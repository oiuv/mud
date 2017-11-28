inherit ROOM;

void create()
{
        set("short", "画廊");
        set("long", @LONG
这是一条非常精美的长廊，柱子和栏杆是用华贵的紫檀木
制成，上面雕饰着美丽的图画，画工精巧，美不胜收。地板不
知是用什么材料做的，走在上面毫无声息，你只感到脚下软软
的，非常舒服。走廊东面是一间房间，里面不时传出几声女子
的娇叱。
LONG);
        set("exits",([
                "north" : __DIR__"changl3",
                "east" : __DIR__"liangong",
                "west" : __DIR__"changl8",
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}