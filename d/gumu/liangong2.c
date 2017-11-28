inherit ROOM;

void create()
{
        set("short", "南练功室");
        set("long", @LONG
这座石室形状甚是奇特，前窄後宽，成为梯形，东边半圆西
边却作三角形状，原来这里是以前重阳祖师的练功室，前窄练掌，
後宽使拳，东圆研剑，西角发镖。北面有个小门洞，通向外面的
练功室和古墓内部。南面有一个小石室。
LONG);
        set("exits", ([
                "north" : __DIR__"liangong",
                "south" : __DIR__"liangong3",
        ]));
        set("for_family", "古墓派");
        setup();
        replace_program(ROOM);
}
