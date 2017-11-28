inherit ROOM;

void create()
{
        set("short", "西门");
        set("long", @LONG
这里是武功镇的西门，眼前城墙高耸，墙上的箭垛里好象
还有人走来走去。阳光照来，城墙上闪过几道白光，似乎是兵
器反射出的光。城门上题着西门两个大字，门口站着一些官兵
正盘问着来往的人们。从这里向北就是终南山脚了。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "east" : __DIR__"xijie",
                "northeast" : __DIR__"shanlu1",
        ]));

        set("objects", ([
                __DIR__"npc/bing" : 2,
                "/clone/npc/xunbu" : 1,
                "/d/beijing/npc/ducha" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
