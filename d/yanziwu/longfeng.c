//ROOM: /d/yanziwu/juxian.c

inherit ROOM;

void create()
{
        set("short", "龙凤厅");
        set("long",@LONG
这是一座气势巍峨，构造宏大的大厅堂，大门前一对大石
狮子张牙舞爪，厅门上「龙凤厅」三个大字遒劲有力，气度不
凡。厅中墙上挂满名人字画，一张大八仙桌上茶具齐整，四周
围着一圈檀香木大椅。
LONG );
        set("exits", ([
            "south" : __DIR__"yimen",
            "east"  : __DIR__"lixiang",
            "west"  : __DIR__"pindi"
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
