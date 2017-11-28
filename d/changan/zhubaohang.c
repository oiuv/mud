//Room: zubaohang.c

inherit ROOM;

void create ()
{
        set ("short", "珠宝行");
        set ("long", @LONG
珠宝行中珠光宝气四射，眩的人有些睁不开眼睛。精致的长柜中陈
设着各类首饰珠宝玉器，几个老行家正陪着客人挑选所需珠宝。一个雕
花木架上摆着颗三尺多高的玉树，珍贵之外又透着淡雅秀丽，曲折含蓄
之气。
LONG);
        set("exits", ([
        	"south" : __DIR__"yongtai-beikou",
        ]));
        set("objects", ([
        	__DIR__"npc/jinfuhuan"  : 1,
        ]));

        setup();
        replace_program(ROOM);
}
