// sldizi.h

void init()
{
	object ob;

	::init();

	if (interactive(ob = this_player()) && ! is_fighting())
        {
		remove_call_out("greeting");
		call_out("greeting", 0, ob);
	}
}

void greeting(object ob)
{
	if (! objectp(ob))
		return;

        if (interactive(ob) && objectp(present("used gao", ob)))
		unconcious();
}
