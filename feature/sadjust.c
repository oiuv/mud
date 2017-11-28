void skill_adjust(object ob)
{
	mapping skl;
	string *sname;
	int i, lmt;

	skl = ob->query_skills();
	if (!sizeof(skl))
		return;
	sname = keys(skl);

	lmt = (int)ob->query("combat_exp");
	lmt = lmt * lmt * lmt / 10;
	for (i = 0; i < sizeof(skl); i++)
		if (SKILL_D(sname[i])->type() == "martial" && skl[sname[i]] > lmt)
			ob->set_skill(sname[i], lmt);
}
			
	
