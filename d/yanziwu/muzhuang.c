// /d/yanziwu/muzhuang.c

inherit ROOM;

void create()
{
        set("short", "木桩");
        set("long",@LONG
烟波浩淼的大湖上，水天一色，多么美丽的地方，在这儿
练功怎能不事半功倍呢。
LONG );
        set("outdoors", "yanziwu");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
