inherit ROOM;

void create()
{
        set("short", "渡船");
        set("long", @LONG
一叶小舟，最多也就能载七、八个人。一名六十多岁的老
艄公手持长竹篙，正在船尾吃力地撑着船。
LONG);
        set("no_clean_up", 0);
        set("outdoors", "zhongzhou");
        setup();
        replace_program(ROOM);
}
