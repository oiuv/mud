
inherit ROOM;

void create()
{
        set("short", "小厅");
        set("long", @LONG
这里是一个小小的厅堂，也许是为了连接前厅与正厅用的。
你走到这里，周围的光线亮了一些，你发觉壁上燃点着一些油
灯。厅里的布置整洁而不简陋，一桌一椅都收拾的井井有条。
LONG
        );

        set("exits", ([
                "south" : __DIR__"zhengting",
                "north" : __DIR__"qianting",
                "west" : __DIR__"xiaowu1",
                "east" : __DIR__"xiaowu2",
        ]));

        setup();
        replace_program(ROOM);
}
