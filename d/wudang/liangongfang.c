inherit ROOM;

void create()
{
        set("short", "练功房");
        set("long", @LONG
这里是练功房，地下凌乱地放着几个蒲团，几位武当弟子
正盘膝坐在上面打坐。
LONG);
        set("exits", ([
                "west" : __DIR__"donglang2",
        ]));
        set("objects", ([
                "/d/village/obj/zhujian" : 3
        ]));
        setup();
}
