#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "百曲湖");
        set("long",@LONG
这是一个支流众多的小河，四面都是菱叶。除了桨声和菱
叶与船身相擦的沙沙轻声，四下一片寂静，湖上清风，夹着淡
淡的花香，你不禁心想:  "就算这样一辈子，也好哇！"
LONG );
        set("outdoors", "yanziwu");
        setup();
        replace_program(ROOM);
}
