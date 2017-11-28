inherit ROOM;

void create()
{
        set("short", "月洞门");
        set("long", @LONG
你穿过走廊，来到一个月洞门前。月洞门门额上写着“琴心”两
字，以蓝色琉璃砌成，笔致苍劲，当是出于秃笔翁的手笔了。过了月
洞门，是一条清幽的花径，两旁修竹姗姗，花径鹅卵石上生满青苔，
显得平素少有人行。
LONG
        );
        set("exits", ([
            "north" : __DIR__"xiaoyuan",
            "south" : __DIR__"xiaodao",
        ]));

        set("outdoors", "meizhuang");

        setup();
        replace_program(ROOM);
}
