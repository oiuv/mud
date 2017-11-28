inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条尘土飞扬的黄土路上，两旁满是阴森森的树林。
东面不远就是衡阳县城了。往西是另外一条大道。
LONG );
        set("outdoors", "hengyang");

        set("exits", ([
                "east"  : __DIR__"hengyang11",
                "west"  : __DIR__"hsroad5",
        ]));

        setup();
        replace_program(ROOM);
}
