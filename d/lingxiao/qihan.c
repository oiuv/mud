inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","气寒轩");
        set("long",@LONG
这里是凌霄城大弟子白万剑及其家人的住所。墙上挂着一副
中堂，上书“气寒西北”，笔法粗犷，显是名家手迹。桌上放着
一壶参阳玉酒，酒香四溢，一位面貌英俊的男子坐在桌旁，正悠
闲自得地修剪桌上的一盆梅花。
LONG);
        set("exits",([
            	"east"  : __DIR__"houyuan2", 
        ]));
        set("objects", ([
                CLASS_D("lingxiao") + "/baiwanjian" : 1,
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

