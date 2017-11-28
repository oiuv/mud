//ROOM: /d/yanziwu/yimen.c

inherit ROOM;

void create()
{
        set("short", "仪门");
        set("long",@LONG
一扇朱漆的雕花大门，一块醒目的牌子挂于门上，上镌黑
色小篆写的 "仪门" 二字，给人一种庄严威武的感觉。东面就
是燕子坞门人休息的地方，向西则是慕容家人用饭的啖糯厅。
LONG );
        set("exits", ([
            "west"  : __DIR__"qinfang1",
            "east"  : __DIR__"dannuo",
            "north" : __DIR__"longfeng",
            "south" : __DIR__"canheju",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
