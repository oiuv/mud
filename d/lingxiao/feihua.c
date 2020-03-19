inherit ROOM;

void create()
{
        set("short","飞花阁");
        set("long",@LONG 
这是凌霄城第六代弟子，「寒梅女侠」花万紫的居所，楼名
飞花阁。花万紫是凌霄城六代弟子中唯一的女性，一来因为避嫌，
二来花万紫本就性喜清净，故一人独居于此。此处是花园小楼之
上，凭窗而望，千万朵梅花迎雪飞舞，万梅飘零，纷纷而下。桌
上放着一束五颜六色的梅花。
LONG);
        set("outdoors", "lingxiao");
        set("exits",([
            "down"  : __DIR__"huajing",  
        ]));
        set("objects", ([
                CLASS_D("lingxiao") + "/huawanzi" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

