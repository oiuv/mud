inherit ROOM;

void create()
{
        set("short", "茶花山");
        set("long", @LONG
你走在茶花山上，这里遍地是生长茂盛的茶花。当然大部
分是凡品，但偶尔也会有一两株佳品藏匿其中。西望不远是大
理城的北门。有些毒蜂飞来飞去，似乎毒蜂巢就在附近。
LONG);
        set("outdoors", "dali");
        set("exits", ([
                "south" : __DIR__"chahuashan2",
        ]));
        setup();
        replace_program(ROOM);
}
