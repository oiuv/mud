inherit ROOM;

void create()
{
        set("short", "北练功室");
        set("long", @LONG
这座石室形状甚是奇特，前窄後宽，成为梯形，东边半圆
西边却作三角形状，原来这是以前重阳祖师的练功室，前窄练
掌，後宽使拳，东圆研剑，西角发镖。南面有个小门洞，通向
里面的练功室。
LONG);
        set("exits", ([
                "east"  : __DIR__"zhengting",
                "south" : __DIR__"liangong2",
        ]));
        set("for_family", "古墓派");
        setup();
        replace_program(ROOM);
}
