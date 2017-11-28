inherit ROOM;

void create()
{
    set("short", "墓道");
    set("long",@LONG
这是通往墓室的通道。通道十分宽敞，顶部悬挂着一颗大
大的夜明珠，照得整个墓道如同白昼。墓道尽头便是墓室。
LONG);
        set("exits", ([
                "up"   : __DIR__"mudi",
                "down" : __DIR__"mushi",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
