// aliasd.c

// #pragma optimize
// #pragma save_binary

mapping global_alias = ([
	"l":		"look",
	"n":		"go north",
	"e":		"go east",
	"w":		"go west",
	"s":		"go south",
	"nu":		"go northup",
	"eu":		"go eastup",
	"wu":		"go westup",
	"su":		"go southup",
	"nd":		"go northdown",
	"ed":		"go eastdown",
	"wd":		"go westdown",
	"sd":		"go southdown",
	"ne":		"go northeast",
	"se":		"go southeast",
	"nw":		"go northwest",
	"sw":		"go southwest",
	"u":		"go up",
	"d":		"go down",
	"i":		"inventory",
	"tt":		"team talk",
]);

string process_global_alias(string arg)
{
	string *word;

        switch (arg[0])
        {
        case '\'':
	        return "say " + arg[1..strlen(arg) - 1];

        case '.':
                return "skip " + arg[1..strlen(arg) - 1];
        }

	word = explode(arg, " ");
	if (sizeof(word) && ! undefinedp(global_alias[word[0]]))
        {
		word[0] = global_alias[word[0]];
		return implode(word, " ");
	}

	return arg;
}
