inherit ROOM;

void create()
{
        set("short", "石阶");
        set("long", @LONG
这是一条宽大坚实的石阶路，不时地有进香客和游人从你
的身边走过。抬头西望，雄伟的三清殿顶浮现在香烟袅绕之中，
巍峨壮观。东边一条石阶通往武当山脚下，隐约可见远处桃花
片片，赏心悦目。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
                "west" : __DIR__"tyroad1",
                "east" : __DIR__"tyroad3",
        ]));
        set("objects", ([
                __DIR__"npc/guest" : 1
        ]));
        setup();
        replace_program(ROOM);
}
