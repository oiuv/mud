#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "太湖");
        set("long",@LONG
绿衫少女脸带微笑，如春花般娇痴无瑕。两手划桨，不时
采摘莲实戏耍。口中漫声唱道:  "菡萏香连十顷陂，小姑贪戏
采莲迟。晚来弄水船头滩，笑脱红裙裹鸭儿。" 碧玉般湖面淡
淡弥散着轻柔的曲调。
LONG );
        set("outdoors", "yanziwu");
        setup();
        replace_program(ROOM);
}

