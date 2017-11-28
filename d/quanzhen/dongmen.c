inherit ROOM;

void create()
{
        set("short", "东门");
        set("long", @LONG
这里是武功镇的东门，眼前城墙高耸，墙上的箭垛里好象
还有人走来走去。阳光照来，城墙上闪过几道白光，似乎是兵
器反射出的光。城门上题着东门两个大字，门口站着一些官兵
正手持兵刃盘问着来往的行人们。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "east" : __DIR__"guandao2",
                "west" : __DIR__"dongjie",
        ]));
        set("objects", ([
                __DIR__"npc/bing" : 2,
                "/clone/npc/xunbu" : 1,
                "/d/beijing/npc/ducha" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
