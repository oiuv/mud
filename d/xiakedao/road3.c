// /d/xiakedao/road3.c 侠客岛 山路3

inherit ROOM;
void create()
{
        set("short", "山路");
        set("long", @LONG
这是通往山顶的小路，路旁杂草丛生，夹杂着一些不知名的野花。
四周静悄悄地没有人声。你深深吸口气，一阵山野的芬芳直入心扉。
LONG );
        set("outdoors", "xiakedao");
        set("exits", ([
                "northdown" : __DIR__"road2",
                "southup" : __DIR__"road4",
        ]));
        setup();
        replace_program(ROOM);
}
