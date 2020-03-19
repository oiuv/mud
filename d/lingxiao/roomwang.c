inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","居室");
        set("long",@LONG 
这里与其说是一间卧室，不如说是一间练功室。地上铺满了
浑圆的黄豆，怎么也站不住。室内立了八根梅花桩，一名身挂披
风的男子正在上面纵跃如飞，看得人眼花缭乱。他正是凌霄城的
六代弟子汪万翼。他的轻功卓绝，在凌霄城数一数二，甚至与白
自在不相上下，谁也不知道他是怎么学上来的，也许可以向他问
问这件事。
LONG);
        set("exits",([
            	"north"  : __DIR__"zoulang1", 
        ]));
        set("objects", ([  
                __DIR__"npc/wang-wanyi" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

