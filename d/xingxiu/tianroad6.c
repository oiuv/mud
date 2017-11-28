inherit ROOM;

void create()
{
        set("short", "天山顶峰");
        set("long", @LONG
这里是天山顶峰。从这里向周围望去，帕米尔高原的风光
尽收眼底。东面一条小路可以下山。山风凛冽，极为强劲，几
乎无法站立。
LONG);
        set("exits", ([
            	"eastdown" : __DIR__"tianroad5",
        ]));
        set("outdoors", "xingxiu");
        setup();
}
