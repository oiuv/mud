inherit ROOM;

void create()
{
        set("short", "竹林");
        set("long", @LONG
这里是青竹林，常有蛇出没。南边是蒿草丛。北边有一个
大岩洞，从里面传出一阵嘶嘶的声音。
LONG);
        set("outdoors", "baituo");
        set("exits",([
                "northup" : __DIR__"cave",
                "south"   : __DIR__"cao2",
        ]));
        set("objects",([
                "/clone/beast/qingshe" : random(3),
                "/clone/beast/dushe" : random(2),
        ]));
        set("quarrys", ([
                "caihuashe"  : 100000,
                "dushe"      : 50000,
                "jinshe"     : 40000,
                "qingshe"    : 40000,
                "yanjingshe" : 5000,
                "mangshe"    : 3000,
        ]));
        setup();
        replace_program(ROOM);
}
