// staff_book.c

inherit BOOK;

void create()
{
        set_name( "杖法通解", ({ "paper" , "shu", "book" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
                set("long", "这是一本破纸片，上面画着舞杖的小人。\n");
		set("value", 100);
		set("material", "paper");
		set("skill", ([
                        "name": "staff",        // name of the skill
                        "exp_required": 10000,  // minimum combat experience required
                        "jing_cost":    50,     // jing cost every time study this
                        "difficulty":   22,     // the base int to learn this skill
                        "max_skill":    139,    // the maximum level you can learn
                        "min_skill":    80,     // the minimum level you can learn
		]));
	}
}
