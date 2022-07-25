inherit ROOM;

void create()
{
        set("short", "渡船");
        set("long", @LONG
一叶小舟，最多也就能载七、八个人。一名六十多岁的老艄公手
持长竹篙，正在船尾吃力地撑着船。
LONG );

        set("outdoors", "wudujiao");
        setup();
        replace_program(ROOM);
}
