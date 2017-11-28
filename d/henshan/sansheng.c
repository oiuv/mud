inherit ROOM;

void create()
{
        set("short", "三生塔");
        set("long", @LONG
三生塔是福严寺开山禅师慧思埋骨处，据说慧思禅师的三
生均埋骨这里，故称三生塔。不远处有棵银杏，据说曾受戒于
慧思禅师，树龄千年，仍亭亭华盖，岁岁青苍。
LONG);
        set("exits", ([ 
               "southup"   : __DIR__"jigaoming",
               "northdown"     : __DIR__"shanlu8",
               "eastdown"  : __DIR__"fuyansi",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

