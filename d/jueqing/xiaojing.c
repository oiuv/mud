inherit ROOM;

void create()
{
        set("short", "小径");
        set("long", @LONG
这是绝情谷大厅通往后花园的一条必经之路。道路两旁花
草丛生，花香宜人。
LONG);
        set("exits", ([
               "east"   : __DIR__"huayuan",
               "west"   : __DIR__"dating",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
