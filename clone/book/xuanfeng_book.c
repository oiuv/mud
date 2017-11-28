// xuanfeng_book.c

inherit BOOK;

void create()
{
        set_name( "旋风扫叶腿法", ({ "paper" , "shu", "book" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
                set("long", 
"这是两张纸片，上面写的都是练功的口诀要旨，却是黄药师的
亲笔，字迹遒劲挺拔，第一叶上右首写着题目，是“旋风扫叶
腿法”六字。\n");
		set("value", 100);
		set("material", "paper");
		set("skill", ([
                        "name": "xuanfeng-leg",        // name of the skill
                        "exp_required": 1000,  // minimum combat experience required
                        "jing_cost":    40,     // jing cost every time study this
                        "difficulty":   20,     // the base int to learn this skill
                        "max_skill":    99,     // the maximum level you can learn
                        "min_skill":    30,     // the minimum level you can learn
		]) );
	}
}

