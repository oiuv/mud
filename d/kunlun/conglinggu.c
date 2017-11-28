inherit ROOM;

void create()
{
        set("short", "葱岭谷");
        set("long",@long
你的眼前突然为之一亮，只见一条象被一刀劈开的峡谷岩
石间，高山的雪水泻落到千丈以下的山涧里去，溅起的密密的
飞沫激起一种惊心动魄的震憾。就在这深山野谷的溪流边，却
长满了各种各样的花草树木，春天繁花开遍峡谷秋天果实压满
山腰，人迹罕至，正是鸟兽们的乐园。
long);
        set("exits",([
                "south" : __DIR__"shanlin" + (random(5) + 1),
        ]));

        set("objects", ([
                "/clone/herb/huangqi"   : random(2),
                "/clone/herb/chongcao"  : random(2),
                "/clone/herb/qianjinzi" : random(2),
                "/clone/herb/fuzi"      : random(2),
                "/clone/herb/renshen"   : random(2),
                "/clone/herb/mahuang"   : random(2),
        ]));

        setup();
        replace_program(ROOM);
}
